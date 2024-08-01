export class CreateAccessToken
{
	readonly access_token: string;
	readonly created_at: number;
	readonly expires_in: number;
	readonly refresh_token: string;
	readonly scope: string;
	readonly secret_valid_until: number;
	readonly token_type: string;
}
