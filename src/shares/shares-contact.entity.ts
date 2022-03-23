import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContactModel } from "src/contacts/contacts.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ShareModel } from "./shares.entity";

@Entity()
export class ShareContactModel {
    @PrimaryGeneratedColumn()
    @ApiPropertyOptional({ type: Number })
    id?: number;

    @Column({
      nullable: false,
    })
    @ApiProperty({ type: Number })
    userId: number;

    @Column({
      nullable: false,
    })
    @ApiProperty({ type: Number })
    shareId: number;

    @Column({
      nullable: false,
    })
    @ApiProperty({ type: Number })
    contactId: number;

    @Column({
      nullable: false,
      default: 'sent'
    })
    @ApiProperty({ type: String })
    state: string;

    @ManyToOne(type => ShareModel)
    share: ShareModel;

    @ManyToOne(type => ContactModel)
    contact: ContactModel;
  }