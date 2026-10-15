declare module '@lhncbc/ucum-lhc' {
  export interface ConvertUnitResult {
    status: 'succeeded' | 'failed' | 'error';
    toVal: number | null;
    msg: string[];
    code?: string;
  }
  export interface ValidateResult {
    status: 'valid' | 'invalid' | 'error';
    ucumCode: string | null;
    msg: string[];
  }
  export const UcumLhcUtils: {
    getInstance(): {
      convertUnitTo(
        fromUnitCode: string,
        fromVal: number,
        toUnitCode: string,
        options?: { suggest?: boolean; molecularWeight?: number; charge?: number },
      ): ConvertUnitResult;
      validateUnitString(unit: string): ValidateResult;
    };
  };
}
