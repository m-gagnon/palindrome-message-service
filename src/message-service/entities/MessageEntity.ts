import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class MessageEntity {
  @PrimaryGeneratedColumn("uuid")
      id: string;

  @Column({
      type: "text",
      nullable: false
  })
      message: string;

  @Column({
      type: "boolean",
      nullable: false
  })
      isPalindrome: boolean;
}
