use anchor_lang::prelude::*;

declare_id!("D1f3iNgSM3rBUysBvXWZZNxaC78ApKQptNKQh9KDkxbr");

#[program]
pub mod solana_direct {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        fund.total_raised = 0;
        fund.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, amount: u64) -> Result<()> {
        let fund = &mut ctx.accounts.fund;
        
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.donor.key(),
            &fund.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.donor.to_account_info(),
                fund.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        fund.total_raised += amount;
        emit!(DonationEvent {
            donor: ctx.accounts.donor.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[account]
pub struct EmergencyFund {
    pub authority: Pubkey,
    pub total_raised: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8)]
    pub fund: Account<'info, EmergencyFund>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Donate<'info> {
    #[account(mut)]
    pub fund: Account<'info, EmergencyFund>,
    #[account(mut)]
    pub donor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct DonationEvent {
    pub donor: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}