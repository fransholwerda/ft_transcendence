export class CreateTokenReq 
{
	readonly grant_type: string;
	readonly client_id: string;
	readonly auth_code: string;
	readonly redirect_uri: string;
}
