
import {IAttack} from "./attacks/IAttack";
import {Damage} from "./Damage";

export interface IDamageable {
    /**
     * Taking damage(hit) from an attack.
     * The receiver is free to apply modifications on this before applying to itself.
     * For example, heavy enemies might reduce the push force. Some enemies be resistant to blunt or fire attacks etc.
     * @param attack
     * @param x Attack source position to use when calculating push, distance etc. This need not match attack.x.
     * @param y
     * @param push The amount of push to apply to the target.
     * @param damage The damage to apply
     */
    onDamage(attack: IAttack, x: number, y: number, push: number, damage: Damage[]);
}