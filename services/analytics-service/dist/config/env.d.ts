interface EnvConfig {
    port: number;
    serviceName: string;
    nodeEnv: string;
    rabbitmq: {
        url: string;
    };
    database: {
        url: string;
    };
}
export declare const config: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map