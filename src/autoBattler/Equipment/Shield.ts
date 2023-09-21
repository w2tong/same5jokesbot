enum ShieldType {
    Light = 'Light',
    Medium = 'Medium',
    Heavy = 'Heavy'
}

type Shield = {
    type: ShieldType;
    armorClass: number;
    physDR?: number;
    magicDR?: number;
    physResist?: number;
    magicResist?: number;
}

const shields: {[id: string]: Shield} = {

};

export { Shield, shields };