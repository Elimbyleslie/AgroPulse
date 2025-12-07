
export interface Farm {
    id:number;
    name:string;
    organizationId: number;
    latitude?: GLfloat;
    longitude?:GLfloat;
    location: string;
    areaUnit: string;
    area: number;
    photo?: string;
    createdAt:Date;
    updatedAt?:Date;
}
 