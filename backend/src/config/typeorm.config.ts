import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: '0.0.0.0',
    port: 5432,
    username: 'postgres',
    password: 'postpass',
    database: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
};