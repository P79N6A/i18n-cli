// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/e69fe60f2d6377ea4fae539493997b098f52cad1/react/react-addons-update.d.ts
declare namespace __React {
    interface UpdateSpecCommand {
        $set?: any;
        $merge?: {};
        $apply?(value: any): any;
    }

    interface UpdateSpecPath {
        [key: string]: UpdateSpec;
    }

    type UpdateSpec = UpdateSpecCommand | UpdateSpecPath;

    interface UpdateArraySpec extends UpdateSpecCommand {
        $push?: any[];
        $unshift?: any[];
        $splice?: any[][];
    }

    namespace __Addons {
        export function update(value: any[], spec: UpdateArraySpec): any[];
        export function update(value: {}, spec: UpdateSpec): any;
    }
}

declare module "react-addons-update" {
    export = __React.__Addons.update;
}