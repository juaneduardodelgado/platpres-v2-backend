import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PresentationModel {
    @PrimaryGeneratedColumn()
    @ApiPropertyOptional({ type: Number })
    id?: number;
  }