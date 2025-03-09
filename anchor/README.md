
<!-- mtoc-start -->

* [Development](#development)
  * [Running tests](#running-tests)

<!-- mtoc-end -->

# Development

> [!WARNING]
> Ensure you unset `RUSTFLAGS` before doing an `anchor build`. I currently have this set
> to `-C link-arg=-fuse-ld=lld` (aka use rust-lld). This causes errors during build, as
> the anchor (via cargo) already uses rust-ldd as the linker. The additional flag is
> reduandant and causes a conflict.

### Running tests
```bash
anchor test --skip-local-validator --skip-deploy
```
We skip validator setup if we already have one running locally in the background.
