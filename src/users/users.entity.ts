import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserModel {
    @PrimaryGeneratedColumn()
    @ApiPropertyOptional({ type: Number })
    id?: number;

    @Column({
      nullable: false,
    })
    @ApiProperty({ type: String })
    name: string;

    @Column({
        nullable: false,
    })
    @ApiProperty({ type: String })
    username: string;

    @Column({
        nullable: false,
    })
    @ApiProperty({ type: String })
    password: string;
  }