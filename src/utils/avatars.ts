// Avatar configuration and helper functions

export type AvatarId = 'focus' | 'calm' | 'energy' | 'balance';

export interface Avatar {
    id: AvatarId;
    name: string;
    image: any; // require() returns any
}

// Custom flat-style avatar illustrations
export const AVATARS: Record<AvatarId, Avatar> = {
    focus: {
        id: 'focus',
        name: 'Focus',
        image: require('../../assets/avatars/focus.png')
    },
    calm: {
        id: 'calm',
        name: 'Calm',
        image: require('../../assets/avatars/calm.png')
    },
    energy: {
        id: 'energy',
        name: 'Energy',
        image: require('../../assets/avatars/energy.png')
    },
    balance: {
        id: 'balance',
        name: 'Balance',
        image: require('../../assets/avatars/balance.png')
    }
};

export const DEFAULT_AVATAR_ID: AvatarId = 'focus';

export const getAvatarSource = (avatarId?: AvatarId | null): any => {
    if (!avatarId || !AVATARS[avatarId]) {
        return AVATARS[DEFAULT_AVATAR_ID].image;
    }
    return AVATARS[avatarId].image;
};

export const getAvatarList = (): Avatar[] => {
    return Object.values(AVATARS);
};
