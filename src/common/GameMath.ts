
export class GameMath {
    //Cut to two decimal places
    public static scale(x: number) {
        return Math.round(x * 100) / 100;
    }
}