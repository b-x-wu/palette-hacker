import { Types } from 'mongoose';
// moves these to @types directory

export interface User {
    id: string;
    palettes: Types.ObjectId[];
}

interface Color {
    red: string;
    green: string;
    blue: string;
}

interface Component {
    selector: string;
    attribute: string;
}

interface Swatch {
    color: Color;
    components: Component[];
}

export interface Palette {
    user: Types.ObjectId;
    website: string;
    name: string;
    palette: Swatch[]
}
// TODO: i didn't realize how confusing it was to have the interface named palette
//       and the property name palette. we should probably change that to 'swatches'
