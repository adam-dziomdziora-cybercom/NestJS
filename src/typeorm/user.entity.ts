import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'Id',
  })
  Id: number;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  FirstName: string;

  @Column({
    nullable: false,
    type: 'varchar',
  })
  LastName: string;

  @Column({
    nullable: true,
    type: 'int',
  })
  CityId: number;
}
