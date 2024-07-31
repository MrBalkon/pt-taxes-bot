import { Injectable } from "@nestjs/common";
import { Operation } from "src/entities/operation.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class OperationRepository extends Repository<Operation> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(Operation, dataSource.createEntityManager());
    }
}