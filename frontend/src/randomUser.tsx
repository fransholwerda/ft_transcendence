import { User } from './PageManager';

// TURN ON/OFF RANDOM USER DEBUG
export const randomDebug = true;
// TURN ON/OFF RANDOM USER DEBUG

const randomNames = [
	'acknowledge', 'acquire', 'across', 'act', 'action', 'active', 'activist', 
	'activity', 'actor', 'actress', 'actual', 'actually', 'ad', 'adapt', 'add', 
	'addition', 'additional', 'address', 'adequate', 'adjust', 'adjustment', 
	'administration', 'administrator', 'admire', 'admission', 'admit', 
	'adolescent', 'adopt', 'adult', 'advance', 'advanced', 'advantage', 
	'adventure', 'advertising', 'advice', 'advise', 'adviser', 'advocate', 
	'affair', 'affect', 'afford', 'afraid', 'after', 'afternoon', 'again', 
	'against', 'age', 'agency', 'agenda', 'agent', 'aggressive', 'ago', 'agree', 
	'agreement', 'agricultural', 'ah', 'ahead', 'aid', 'aircraft', 'airline', 
	'airport', 'album', 'alcohol', 'alive', 'all', 'alliance', 'allow', 'ally', 
	'almost', 'alone', 'along', 'already', 'also', 'alter', 'alternative', 
	'although', 'always', 'among', 'amount', 'analysis', 'analyst', 'analyze', 
	'ancient', 'and', 'anger', 'angle', 'angry', 'animal', 'anniversary', 
	'announce', 'annual', 'another', 'answer', 'anticipate', 'anxiety', 'any', 
	'anybody', 'anymore', 'anyone', 'anything', 'anyway', 'anywhere', 'apart', 
	'apartment', 'apparent', 'apparently', 'appeal', 'appear', 'appearance', 
	'apple', 'application', 'apply', 'appoint', 'appointment', 'appreciate', 
	'approach', 'appropriate', 'approval', 'approve', 'approximately', 'area', 
	'argue', 'argument', 'arise', 'arm', 'armed', 'army', 'around', 'arrange', 
	'arrangement', 'arrest', 'arrival', 'arrive', 'art', 'article', 'artist', 
	'artistic', 'aspect', 'assault', 'assert', 'assess', 'assessment', 'asset', 
	'assign', 'assignment', 'assist', 'assistance', 'assistant', 'associate', 
	'association', 'assume', 'assumption', 'assure', 'at', 'athlete', 'athletic', 
	'atmosphere', 'attach', 'attack', 'attempt', 'attend', 'attention', 
	'attitude', 'attorney', 'attract', 'attractive', 'attribute', 'audience', 
	'author', 'authority', 'auto', 'available', 'average', 'avoid', 'award', 
	'aware', 'awareness', 'away', 'awful', 'baby', 'back', 'background', 'bad', 
	'badly', 'bag', 'bake', 'balance', 'ball', 'ban', 'band', 'bank', 'bar', 
	'barely', 'barrel', 'barrier', 'base', 'baseball', 'basic', 'basically', 
	'basis', 'basket', 'basketball', 'bathroom', 'battery', 'battle', 'be', 
	'beach', 'bean', 'bear', 'beat', 'beautiful', 'beauty', 'because', 'become', 
	'bed', 'bedroom', 'beer', 'behind', 'being', 'belief', 'believe', 'bell', 
	'belong', 'below', 'belt', 'bench', 'bend', 'beneath', 'benefit', 'beside', 
	'besides', 'best', 'bet', 'better', 'between', 'beyon', 'bike', 'bill', 
	'billion', 'bind', 'biological', 'bird', 'birth', 'birthday', 'bit', 'bite', 
	'black', 'blade', 'blame', 'blanket', 'blind', 'block', 'blood', 'blow', 
	'blue', 'board', 'boat', 'body', 'bomb', 'bombing', 'bond', 'bone', 'book', 
	'boom', 'boot', 'border', 'born', 'borrow', 'boss', 'both', 'bother', 
	'bottle', 'bottom', 'boundary', 'bowl', 'box', 'boy', 'boyfriend', 'brain', 
	'branch', 'brand', 'bread', 'break', 'breakfast', 'breast', 'breath', 
	'breathe', 'brick', 'bridge', 'brief', 'briefly', 'bright', 'brilliant', 
	'bring', 'British', 'broad', 'broken', 'brother', 'brown', 'brush', 'buck', 
	'budget', 'build', 'building', 'bullet', 'bunch', 'burden', 'burn', 'bury', 
	'bus', 'business', 'busy', 'but', 'butter', 'button', 'buy', 'buyer', 'by', 
	'cabin', 'cabinet', 'cable', 'cake', 'calculate', 'call', 'camera', 'camp', 
	'campaign', 'campus', 'can', 'Canadian', 'cancer', 'candidate', 'cap', 
	'capability', 'capable', 'capacity', 'capital', 'captain', 'capture', 'car', 
	'carbon', 'card', 'care', 'career', 'careful', 'carefully', 'carrier', 
	'carry', 'case', 'cash', 'cast', 'cat', 'catch', 'category', 'Catholic', 
	'cause', 'ceiling', 'celebrate', 'celebration', 'celebrity', 'cell', 
	'center', 'central', 'century', 'CEO', 'ceremony', 'certain', 'certainly', 
	'chain', 'chair', 'chairman', 'challenge', 'chamber', 'champion', 
	'championship', 'chance', 'change', 'changing', 'channel', 'chapter', 
	'character', 'characteristic', 'characterize', 'charge', 'charity', 'chart', 
	'chase', 'cheap', 'check', 'cheek', 'cheese', 'chef', 'chemical', 'chest', 
	'chicken', 'chief', 'child', 'childhood', 'Chinese', 'chip', 'chocolate', 
	'choice', 'cholesterol', 'choose', 'Christian', 'Christmas', 'church', 
	'cigarette', 'circle', 'circumstance', 'cite', 'citizen', 'city', 'civil', 
	'civilian', 'claim', 'class', 'classic', 'classroom', 'clean', 'clear', 
	'clearly', 'client', 'climate', 'climb', 'clinic', 'clinical', 'clock', 
	'close', 'closely', 'closer', 'clothes', 'clothing', 'cloud', 'club', 
	'clue', 'cluster', 'coach', 'coal', 'coalition', 'coast', 'coat', 'code', 
	'coffee', 'cognitive', 'cold', 'collapse', 'colleague', 'collect', 
	'collection', 'collective', 'college', 'colonial', 'color', 'column', 
	'combination', 'combine', 'come', 'comedy', 'comfort', 'comfortable', 
	'command', 'commander', 'comment', 'commercial', 'commission', 'commit', 
	'commitment', 'committee', 'common', 'communicate', 'communication', 
	'community', 'company', 'compare', 'comparison', 'compete', 'competition', 
	'competitive', 'competitor', 'complain', 'complaint', 'complete', 
	'completely', 'complex', 'complicated', 'component', 'compose', 
	'composition', 'comprehensive', 'computer', 'concentrate', 'concentration', 
	'concept', 'concern', 'concerned', 'concert', 'conclude', 'conclusion', 
	'concrete', 'condition', 'conduct', 'conference', 'confidence', 'confident', 
	'confirm'];  
const randomNamesLength = randomNames.length;

function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

function setCookie(name: string, value: string, hours: number): void {
    let expires = '';
    if (hours) {
        const date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000)); // Convert hours to milliseconds
        expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=/`;
}

let randomNamesIndex = parseInt(getCookie('randomNamesIndex') || '0', 10) || 0;

const createRandomUser = (): User => {  
    const user: User = {
        id: randomNamesIndex.toString(),
        username: randomNames[randomNamesIndex],
        avatarURL: ''
    };
    setCookie('randomNamesIndex', randomNamesIndex.toString(), 4); // Persist for 4 hours
    randomNamesIndex = (randomNamesIndex + 1) % randomNamesLength;
    return user;
};

export default createRandomUser;
