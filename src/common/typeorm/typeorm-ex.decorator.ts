import { SetMetadata } from '@nestjs/common';

export const TYPEORM_EX_CUSTOM_REPOSITORY = 'TYPEORM_EX_CUSTOM_REPOSITORY';

export type CustomRepositoryDecorator<T> = (entity: new () => T) => ClassDecorator;

export const CustomRepository = <T>(entity: new () => T): ClassDecorator => {
    return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
};

// If arguments are needed
// export type EntityConstructor<T = any> = new (...args: any[]) => T;

// export function CustomRepository<T>(entity: EntityConstructor<T>): ClassDecorator {
//     return SetMetadata(TYPEORM_EX_CUSTOM_REPOSITORY, entity);
// }
