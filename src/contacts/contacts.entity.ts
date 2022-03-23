import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ContactModel {
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
    @ApiProperty({ type: String })
    email: string;

    @Column({
      nullable: false,
    })
    @ApiProperty({ type: String })
    name: string;

    @Column({
      nullable: false,
    })
    @ApiProperty({ type: String })
    phone: string;
  }