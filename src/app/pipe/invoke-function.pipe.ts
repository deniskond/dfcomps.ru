import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'invokeFunction',
})
export class InvokeFunctionPipe implements PipeTransform {
    transform(target: any, func: (...args: any) => any, additionalArgs?: any): any {
        return additionalArgs ? func(target) : func(target, additionalArgs);
    }
}
