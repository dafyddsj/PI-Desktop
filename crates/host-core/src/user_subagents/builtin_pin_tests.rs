use super::*;
use tempfile::tempdir;

fn pin_path(dir: &std::path::Path) -> std::path::PathBuf {
    dir.join("agent-capabilities/subagent-builtin-models.json")
}

#[test]
fn set_persists_across_reopen() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    let handle = registry
        .set_builtin_model("Explorer", Some("anthropic/claude-haiku-4-5"))
        .unwrap();
    assert_eq!(handle, "explorer");
    assert_eq!(
        registry
            .builtin_model_pins()
            .get("explorer")
            .map(String::as_str),
        Some("anthropic/claude-haiku-4-5")
    );

    let reopened = UserSubagentRegistry::new(dir.path());
    assert_eq!(
        reopened
            .builtin_model_pins()
            .get("explorer")
            .map(String::as_str),
        Some("anthropic/claude-haiku-4-5")
    );
}

#[test]
fn clear_removes_the_key() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    registry
        .set_builtin_model("explorer", Some("anthropic/claude-haiku-4-5"))
        .unwrap();
    registry.set_builtin_model("explorer", Some("")).unwrap();
    assert!(registry.builtin_model_pins().get("explorer").is_none());

    let reopened = UserSubagentRegistry::new(dir.path());
    assert!(reopened.builtin_model_pins().get("explorer").is_none());
}

#[test]
fn same_pin_twice_does_not_change_bytes() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    registry
        .set_builtin_model("explorer", Some("anthropic/claude-haiku-4-5"))
        .unwrap();
    let before = fs::read(pin_path(dir.path())).unwrap();
    registry
        .set_builtin_model("explorer", Some("anthropic/claude-haiku-4-5"))
        .unwrap();
    assert_eq!(fs::read(pin_path(dir.path())).unwrap(), before);
}

#[test]
fn invalid_pin_writes_nothing() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    let error = registry
        .set_builtin_model("explorer", Some("noslash"))
        .unwrap_err();
    assert!(error.to_string().contains("SUBAGENT_INVALID"));
    assert!(!pin_path(dir.path()).exists());
    assert!(registry.builtin_model_pins().is_empty());
}

#[test]
fn unknown_handle_is_sticky() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    registry
        .set_builtin_model("not-a-shipped-agent", Some("anthropic/claude-haiku-4-5"))
        .unwrap();

    let reopened = UserSubagentRegistry::new(dir.path());
    assert_eq!(
        reopened
            .builtin_model_pins()
            .get("not-a-shipped-agent")
            .map(String::as_str),
        Some("anthropic/claude-haiku-4-5")
    );
}

#[test]
fn enablement_and_pin_are_independent() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    registry.set_builtin_enabled("fixer", false).unwrap();
    registry
        .set_builtin_model("fixer", Some("anthropic/claude-haiku-4-5"))
        .unwrap();
    assert_eq!(registry.disabled_builtins(), vec!["fixer".to_string()]);
    assert_eq!(
        registry
            .builtin_model_pins()
            .get("fixer")
            .map(String::as_str),
        Some("anthropic/claude-haiku-4-5")
    );

    registry.set_builtin_enabled("fixer", true).unwrap();
    assert!(registry.disabled_builtins().is_empty());
    assert_eq!(
        registry
            .builtin_model_pins()
            .get("fixer")
            .map(String::as_str),
        Some("anthropic/claude-haiku-4-5")
    );
}

#[test]
fn leftover_temp_file_leaves_the_previous_file_readable() {
    let dir = tempdir().unwrap();
    let mut registry = UserSubagentRegistry::new(dir.path());
    registry
        .set_builtin_model("explorer", Some("anthropic/claude-haiku-4-5"))
        .unwrap();
    let temporary = pin_path(dir.path()).with_extension("json.tmp");
    fs::write(
        &temporary,
        br#"{ "values": { "explorer": "other/broken" } }"#,
    )
    .unwrap();

    let reopened = UserSubagentRegistry::new(dir.path());
    assert_eq!(
        reopened
            .builtin_model_pins()
            .get("explorer")
            .map(String::as_str),
        Some("anthropic/claude-haiku-4-5")
    );
}
