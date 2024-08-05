import { Injectable } from "@nestjs/common";
import { UserField } from "src/entities/user-field.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UserFieldRepository extends Repository<UserField> {
    constructor(
		private dataSource: DataSource
	)
	{
        super(UserField, dataSource.createEntityManager());
    }

	async getUserFieldsBySystemNames(systemNames: string[]) {
		return this.createQueryBuilder('userField')
		  .where('userField.systemName IN (:...systemNames)', { systemNames })
		  .getMany();
	}

	async getUserFieldsByIds(ids: number[]) {
		return this.createQueryBuilder('userField')
		  .where('userField.id IN (:...ids)', { ids })
		  .getMany();
	}
}