use anchor_lang::error_code;

#[error_code]
pub enum ErrorCode {
    #[msg("Claiming is not available yet.")]
    ClaimNotAvailable,
    #[msg("There is nothing to claim.")]
    NothingToClaim,
}