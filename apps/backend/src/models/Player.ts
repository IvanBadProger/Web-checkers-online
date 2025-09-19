import type { Color, Player as TPlayer } from "@checkers/shared"

export class PlayerModel implements TPlayer {
  constructor(public id: string, public username: string, public color: Color | null = null) {}
}
