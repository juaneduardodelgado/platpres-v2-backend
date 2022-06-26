import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CardModel } from "src/cards/cards.entity";
import { PresentationModel } from "src/presentations/presentations.entity";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class ShareModel {
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
    cardId: number;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: Number })
    presentationId: number;

    @Column({
      nullable: false,
      default: 'created',
    })
    @ApiProperty({ type: String })
    state: string;

    @Column({
      nullable: true,
    })
    @ApiProperty({ type: String })
    csvPath: string;

    @ManyToOne(type => CardModel)
    card: CardModel;

    @ManyToOne(type => PresentationModel)
    presentation: PresentationModel;
  }