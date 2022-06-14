import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PresentationModel {
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
    title: string;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: String })
    description: string;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: String })
    videoPath: string;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: String })
    thumbPath: string;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: String })
    videoUri: string;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: String })
    thumbUri: string;

    @Column({
      nullable: true,
      default: 'created',
    })
    @ApiProperty({ type: String })
    state: string;
  }