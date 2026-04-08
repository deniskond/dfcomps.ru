import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'invokeFunction',
  standalone: false,
})
export class InvokeFunctionPipe implements PipeTransform {
  transform(target: any, func: (...args: any) => any, additionalArgs?: any): any {
    return additionalArgs !== undefined ? func(target, additionalArgs) : func(target);
  }
}
