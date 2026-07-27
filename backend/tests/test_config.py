"""Settings validators — API-key entropy, debug guard, deployment requirements."""

import base64

import pytest
from pydantic import SecretStr

from app.config import MIN_API_KEY_BYTES, Settings, _decoded_entropy_bytes

STRONG_HEX_KEY = "a" * 64  # 32 bytes decoded


def make_settings(**overrides):
    """Build Settings with explicit values so ambient env/.env cannot interfere.

    Explicit kwargs take priority over environment variables in pydantic-settings.
    """
    base = {"api_key": STRONG_HEX_KEY, "env": "local"}
    base.update(overrides)
    return Settings(_env_file=None, **base)


def test_decoded_entropy_hex():
    assert _decoded_entropy_bytes("a" * 64) == 32


def test_decoded_entropy_base64():
    b64 = base64.b64encode(b"x" * 32).decode()
    assert _decoded_entropy_bytes(b64) == 32


def test_decoded_entropy_raw_passphrase():
    # Not hex, not base64 — counted as raw UTF-8 bytes.
    passphrase = "correct horse battery staple sentinel!"
    assert _decoded_entropy_bytes(passphrase) == len(passphrase.encode())


def test_missing_api_key_raises():
    with pytest.raises(ValueError, match="API_KEY is required"):
        make_settings(api_key="")


def test_weak_api_key_raises():
    with pytest.raises(ValueError, match="too weak"):
        make_settings(api_key="short")


def test_strong_hex_key_accepted():
    settings = make_settings()
    assert settings.api_key.get_secret_value() == STRONG_HEX_KEY


def test_min_api_key_bytes_constant():
    assert MIN_API_KEY_BYTES == 32


def test_debug_in_production_is_rejected():
    with pytest.raises(ValueError, match="DEBUG=true is not permitted"):
        make_settings(env="production", debug=True)


def test_debug_allowed_outside_production():
    settings = make_settings(env="local", debug=True)
    assert settings.debug is True


def test_deployment_requires_smtp_when_staging():
    with pytest.raises(ValueError, match="SMTP_USER"):
        make_settings(env="staging")


def test_deployment_settings_satisfied():
    settings = make_settings(
        env="staging",
        smtp_user="sender@x.com",
        smtp_password=SecretStr("pw"),
        notification_email="ops@x.com",
    )
    assert settings.env == "staging"


def test_local_does_not_require_smtp():
    settings = make_settings(env="local")
    assert settings.smtp_user == ""


def test_cors_origins_property_splits_and_trims():
    settings = make_settings(allowed_origins="http://a.com, http://b.com ,")
    assert settings.cors_origins == ["http://a.com", "http://b.com"]


def test_trusted_proxy_list_property():
    settings = make_settings(trusted_proxies="10.0.0.0/8, 172.16.0.0/12")
    assert settings.trusted_proxy_list == ["10.0.0.0/8", "172.16.0.0/12"]


def test_trusted_proxy_list_empty_by_default():
    assert make_settings().trusted_proxy_list == []
