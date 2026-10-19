<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All application data and identity flow through src/lib/store.tsx, using the generated browser Cloud client and RLS; this preserves the public page API and scopes library records to the signed-in user.
- Store context identity lives in a separate store-context module and survives development hot updates; this keeps mounted providers and refreshed consumers connected without caching user data globally.
- The root owns the single identity-transition listener; public pages show inline sign-in actions instead of redirect guards, so the landing and community remain browsable.
- Bundled fictional catalog IDs remain stable and shared while user library rows use a composite user/movie primary key, so demo media can be saved persistently without duplicating user records.
- CameraHeader owns scroll animation and MovieDetailModal is shared by catalog, feed, and habits; reusable media components remain type-agnostic.
- Media components take a mediaType prop (movie|book) so books can be added without new components.
