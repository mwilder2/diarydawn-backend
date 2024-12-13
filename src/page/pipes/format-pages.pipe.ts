import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FormatPagesPipe implements PipeTransform {
    // transform(value: any, metadata: ArgumentMetadata) {
    transform(value: any) {
        return value;
    }
}
