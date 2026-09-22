export class Student {
    constructor(
        public readonly id: string,
        public studentCode: string,
        public name: string,
        public email: string,
        public contact: string,
        public guardianName: string | null = null,
        public guardianContact: string | null = null,
        public address: string | null = null,
        public readonly joinedDate: Date = new Date(),
        /** Asgardeo `sub` claim, linked on first login (by matching email) so later logins resolve directly. */
        public asgardeoSub: string | null = null,
        public faculty: string | null = null,
        public degreeProgram: string | null = null,
        public academicYear: string | null = null,
        public nic: string | null = null,
    ) { }
}
