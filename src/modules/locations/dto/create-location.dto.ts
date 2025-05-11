export class CreateLocationDto {
  name: string;
  parent?: string; // optional: used to create sub-towns
}
