import 'reflect-metadata';
import { randomUUID } from 'crypto';
import mysql from 'mysql2/promise';
import { DataSource } from 'typeorm';
import { RoomOrmEntity } from '../src/infrastructure/database/entities/room.orm-entity';
import { BuildingOrmEntity } from '../src/infrastructure/database/entities/building.orm-entity';
import { BedOrmEntity } from '../src/infrastructure/database/entities/bed.orm-entity';
import { RoomRepository } from '../src/infrastructure/database/repositories/room.repository';
import { Room } from '../src/domain/entities/Room';

// Runs against a REAL MySQL instance (see test:db-integration script) instead
// of a mocked repository. The point is to exercise things a mock can't:
// - what TypeORM's mysql2 driver actually hands back for a DECIMAL column
//   (as opposed to whatever type a jest.fn() mock is told to return)
// - real unique-constraint enforcement
// - real soft-delete filtering behaviour
//
// Requires a MySQL server reachable at DB_HOST/DB_PORT (defaults match the
// docker-compose service on port 3308). Not run by `npm test` - see
// package.json's separate `test:db-integration` script and cloudbuild note.
const DB_HOST = process.env.DB_HOST ?? '127.0.0.1';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3308;
const DB_USERNAME = process.env.DB_USERNAME ?? 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'ishakya0809';
const TEST_DB = 'accommodation_db_integrity_test';

describe('RoomRepository against a real MySQL database', () => {
  let dataSource: DataSource;
  let repository: RoomRepository;

  beforeAll(async () => {
    // TypeORM needs the database to already exist before it can connect to it.
    const admin = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USERNAME, password: DB_PASSWORD });
    await admin.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await admin.query(`CREATE DATABASE \`${TEST_DB}\``);
    await admin.end();

    dataSource = new DataSource({
      type: 'mysql',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: TEST_DB,
      entities: [RoomOrmEntity, BuildingOrmEntity, BedOrmEntity],
      synchronize: true,
    });
    await dataSource.initialize();

    repository = new RoomRepository(dataSource.getRepository(RoomOrmEntity));
  }, 30_000);

  afterAll(async () => {
    await dataSource.destroy();
    const admin = await mysql.createConnection({ host: DB_HOST, port: DB_PORT, user: DB_USERNAME, password: DB_PASSWORD });
    await admin.query(`DROP DATABASE IF EXISTS \`${TEST_DB}\``);
    await admin.end();
  });

  function makeRoom(overrides: Partial<{ roomNumber: string; rentPerMonth: number }> = {}) {
    return new Room(
      randomUUID(), // matches CreateRoomUseCase, which generates the id in the application layer
      overrides.roomNumber ?? `R-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      2,
      'Male',
      true,
      'AC',
      overrides.rentPerMonth ?? 15000.5,
      1,
      null,
    );
  }

  it('documents that a real MySQL DECIMAL column round-trips as a STRING, not a number', async () => {
    const saved = await repository.save(makeRoom({ rentPerMonth: 15000.5 }));
    const fetched = await repository.findById(saved.roomId);

    expect(fetched).not.toBeNull();
    // This is the finding: TypeORM's mysql2 driver returns DECIMAL columns as
    // strings by default. A mocked repository test would never catch this,
    // because the mock returns whatever type the test author typed in by
    // hand - which is exactly how this class of bug (see the mobile app's
    // earlier "String is not a subtype of type num" crash on this same
    // rentPerMonth field) reached a real client undetected.
    expect(typeof fetched!.rentPerMonth).toBe('string');
    expect(fetched!.rentPerMonth).toBe('15000.50');
  });

  it('enforces the unique constraint on roomNumber at the database level', async () => {
    const room = makeRoom({ roomNumber: 'DUPLICATE-TEST-101' });
    await repository.save(room);

    await expect(repository.save(makeRoom({ roomNumber: 'DUPLICATE-TEST-101' }))).rejects.toThrow();
  });

  it('excludes soft-deleted rooms from findById, matching the domain contract', async () => {
    const saved = await repository.save(makeRoom());
    await repository.delete(saved.roomId);

    const fetched = await repository.findById(saved.roomId);
    expect(fetched).toBeNull();
  });
});
