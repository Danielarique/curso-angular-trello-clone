import { Colors } from "./colors.model";
import { User } from "./user.model";

export interface Board{
    id: string;
    title: string;
    backgroundColor: Colors;
    members: User[];
}