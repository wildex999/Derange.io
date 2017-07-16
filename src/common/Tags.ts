
export class Tags {
    public static Entity = "entity";
    public static Player = "player";
    public static Enemy = "enemy";

    /**
     * Check if the given array contains a given tag.
     */
    public static Has(arr: string[], tag: string) {
        return (arr.indexOf(tag) != -1);
    }
}