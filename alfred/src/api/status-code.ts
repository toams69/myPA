export enum StatusCode {
///////////////////////////////////////////////////////////
// Common
///////////////////////////////////////////////////////////
	OK 												= 0,
	ParameterMissing								= 1,
	InvalidParameter								= 2,
	Forbidden										= 3,
	InternalError									= 4,
	Unauthorized									= 5,
	ResourceNotFound								= 6,
	PartialResult                                   = 7,

///////////////////////////////////////////////////////////
// login
///////////////////////////////////////////////////////////
	GetTokenFailed 									= 7000, 
	UsernameNotProvided							    = 7001,
	PasswordNotProvided 						    = 7002,
	RedisDown										= 7003,
	ChangePasswordFailed						    = 7004
}
