import { ConverterSvgService } from './svg/svg.service.ts'

export class ConverterService {
  svg(svgContent: string) {
    return new ConverterSvgService(svgContent)
  }
}
