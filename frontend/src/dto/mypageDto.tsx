import {bankAccount} from "./common/bankAccount.tsx";

export interface CareGiverForProfileDto {
    id: number;
    name: string;
    gender?: string;
    age?: number;
    address?: string;
    guardian_id: number;
    created_at: string;
    updated_at: string;
    phoneNumber:string;
    email:string;
    salaryAccount : bankAccount;
    totalHours:number;
    currentMonthHours:number;

}