import { Injectable } from "@nestjs/common";
import { UserField } from "src/entities/user-field.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserFieldRepository extends Repository<UserField> {

}