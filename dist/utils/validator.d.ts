export type ValidationRule = {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
    message?: string;
};
export type ValidationSchema = {
    [key: string]: ValidationRule;
};
export interface ValidationError {
    field: string;
    message: string;
    rule?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export declare class Validator {
    private schema;
    constructor(schema: ValidationSchema);
    validate(data: Record<string, any>): ValidationResult;
    static email(value: string): boolean;
    static url(value: string): boolean;
    static alphanumeric(value: string): boolean;
    static numeric(value: string): boolean;
}
export declare const commonSchemas: {
    email: {
        email: {
            required: boolean;
            type: "string";
            custom: (value: string) => true | "Invalid email format";
        };
    };
    password: {
        password: {
            required: boolean;
            type: "string";
            min: number;
            message: string;
        };
    };
    username: {
        username: {
            required: boolean;
            type: "string";
            min: number;
            max: number;
            pattern: RegExp;
            message: string;
        };
    };
};
