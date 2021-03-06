import Model from '../model/Model';
import { OrdinalNumber, OrdinalRawValue } from '../util/types';
declare class OrdinalMeta {
    readonly categories: OrdinalRawValue[];
    private _needCollect;
    private _deduplication;
    private _map;
    constructor(opt: {
        categories?: OrdinalRawValue[];
        needCollect?: boolean;
        deduplication?: boolean;
    });
    static createByAxisModel(axisModel: Model): OrdinalMeta;
    getOrdinal(category: OrdinalRawValue): OrdinalNumber;
    /**
     * @return The ordinal. If not found, return NaN.
     */
    parseAndCollect(category: OrdinalRawValue | OrdinalNumber): OrdinalNumber;
    private _getOrCreateMap;
}
export default OrdinalMeta;
