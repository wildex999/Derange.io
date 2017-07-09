///<reference path="model.ts"/>

export class MapDownload implements Model {
    public static eventId = "MapDownload";

    public mapJson: any;

    constructor(mapJson?: any) {
        this.mapJson = mapJson || null;
    }

    public getEventId(): string {
        return MapDownload.eventId;
    }
}