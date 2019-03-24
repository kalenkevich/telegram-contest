export default class DataChangeEvent {
    constructor(type, data, prevData) {
        this.type = type;
        this.data = data;
        this.prevData = prevData;
    }

    static get EventTypes () {
        return {
            APPEARED: 'APPEARED',
            DISAPPEARED: 'DISAPPEARED',
            SHIFTED: 'SHIFTED',
            STRETCHED: 'STRETCHED',
        }
    }
}
