import { Types } from 'mongoose';
// moves these to @types directory

export interface User {
    username: string;
    hash: string;
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
