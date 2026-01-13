(() => {
	"use strict";

	const $ = (selector) => document.querySelector(selector);
	const $$ = (selector) => Array.from(document.querySelectorAll(selector));

	const root = document.documentElement;
	const previewTitle = $("#previewTitle");
	const previewSubtitle = $("#previewSubtitle");
	const previewBadge = $("#previewBadge");
	const supportPill = $("#supportPill");
	const styleChips = $("#styleChips");
	const miniGallery = $("#miniGallery");
	const codeBox = $("#codeBox");
	const copyStatus = $("#copyStatus");

	const inputs = {
		blur: $("#blur"),
		opacity: $("#opacity"),
		sat: $("#sat"),
		bright: $("#bright"),
		border: $("#border"),
		radius: $("#radius"),
		tintHue: $("#tintHue"),
		tintAlpha: $("#tintAlpha"),
		noise: $("#noise"),
		shadow: $("#shadow"),
	};

	const buttons = {
		copyAll: $("#copyAll"),
		copyHTML: $("#copyHTML"),
		copyCSS: $("#copyCSS"),
		reset: $("#reset"),
	};

	const PRESETS = {
		iphone: {
			label: "iPhone Frosted",
			subtitle: "Clean, soft blur — mobile style.",
			vars: {
				"--glass-blur": "18px",
				"--glass-bg-opacity": "0.16",
				"--glass-sat": "160%",
				"--glass-bright": "115%",
				"--glass-border-alpha": "0.28",
				"--glass-radius": "22px",
				"--glass-tint-hue": "210",
				"--glass-tint-alpha": "0.08",
				"--glass-noise": "0.06",
				"--glass-shadow-strength": "0.72",
			},
		},
		frosted: {
			label: "Frosted (Strong)",
			subtitle: "More opaque + heavier blur.",
			vars: {
				"--glass-blur": "26px",
				"--glass-bg-opacity": "0.24",
				"--glass-sat": "145%",
				"--glass-bright": "120%",
				"--glass-border-alpha": "0.34",
				"--glass-radius": "22px",
				"--glass-tint-hue": "210",
				"--glass-tint-alpha": "0.06",
				"--glass-noise": "0.08",
				"--glass-shadow-strength": "0.8",
			},
		},
		aqua: {
			label: "Acrylic (Aqua)",
			subtitle: "Windows-like acrylic tint.",
			vars: {
				"--glass-blur": "22px",
				"--glass-bg-opacity": "0.15",
				"--glass-sat": "175%",
				"--glass-bright": "112%",
				"--glass-border-alpha": "0.3",
				"--glass-radius": "20px",
				"--glass-tint-hue": "200",
				"--glass-tint-alpha": "0.16",
				"--glass-noise": "0.06",
				"--glass-shadow-strength": "0.74",
			},
		},
		dark: {
			label: "Dark Glass",
			subtitle: "Smoky look for dark UI.",
			vars: {
				"--glass-blur": "20px",
				"--glass-bg-opacity": "0.10",
				"--glass-sat": "135%",
				"--glass-bright": "105%",
				"--glass-border-alpha": "0.22",
				"--glass-radius": "22px",
				"--glass-tint-hue": "250",
				"--glass-tint-alpha": "0.10",
				"--glass-noise": "0.06",
				"--glass-shadow-strength": "0.95",
			},
		},
		neon: {
			label: "Neon Edge",
			subtitle: "Punchy border + color tint.",
			vars: {
				"--glass-blur": "16px",
				"--glass-bg-opacity": "0.12",
				"--glass-sat": "190%",
				"--glass-bright": "118%",
				"--glass-border-alpha": "0.52",
				"--glass-radius": "24px",
				"--glass-tint-hue": "310",
				"--glass-tint-alpha": "0.18",
				"--glass-noise": "0.05",
				"--glass-shadow-strength": "0.9",
			},
		},
	};

	let activePresetKey = "iphone";
	let defaultVars = null;

	function supportsBackdropFilter() {
		return (
			(window.CSS &&
				(CSS.supports("backdrop-filter: blur(1px)") ||
					CSS.supports("-webkit-backdrop-filter: blur(1px)"))) ||
			false
		);
	}

	function setVar(name, value) {
		root.style.setProperty(name, value);
	}

	function getVar(name) {
		const value = getComputedStyle(root).getPropertyValue(name);
		return value.trim();
	}

	function numberFromCss(value) {
		const trimmed = String(value).trim();
		if (trimmed.endsWith("px")) return Number(trimmed.replace("px", ""));
		if (trimmed.endsWith("%")) return Number(trimmed.replace("%", ""));
		return Number(trimmed);
	}

	function syncInputsFromVars() {
		inputs.blur.value = numberFromCss(getVar("--glass-blur"));
		inputs.opacity.value = numberFromCss(getVar("--glass-bg-opacity"));
		inputs.sat.value = numberFromCss(getVar("--glass-sat"));
		inputs.bright.value = numberFromCss(getVar("--glass-bright"));
		inputs.border.value = numberFromCss(getVar("--glass-border-alpha"));
		inputs.radius.value = numberFromCss(getVar("--glass-radius"));
		inputs.tintHue.value = numberFromCss(getVar("--glass-tint-hue"));
		inputs.tintAlpha.value = numberFromCss(getVar("--glass-tint-alpha"));
		inputs.noise.value = numberFromCss(getVar("--glass-noise"));
		inputs.shadow.value = numberFromCss(getVar("--glass-shadow-strength"));
	}

	function applyPreset(key) {
		activePresetKey = key;
		const preset = PRESETS[key];
		Object.entries(preset.vars).forEach(([k, v]) => setVar(k, v));
		previewTitle.textContent = preset.label;
		previewSubtitle.textContent = preset.subtitle;
		syncInputsFromVars();
		updateCodeBox();
		updateActiveChip();
		updateMiniSelection();
	}

	function updateActiveChip() {
		$$("#styleChips .chip").forEach((el) => {
			el.classList.toggle(
				"active",
				el.dataset.preset === activePresetKey
			);
		});
	}

	function updateMiniSelection() {
		$$("#miniGallery [data-preset]").forEach((el) => {
			el.classList.toggle(
				"active",
				el.dataset.preset === activePresetKey
			);
		});
	}

	function escapeHtml(text) {
		return String(text)
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;");
	}

	function currentCssValues() {
		return {
			blur: getVar("--glass-blur"),
			opacity: getVar("--glass-bg-opacity"),
			sat: getVar("--glass-sat"),
			bright: getVar("--glass-bright"),
			border: getVar("--glass-border-alpha"),
			radius: getVar("--glass-radius"),
			tintHue: getVar("--glass-tint-hue"),
			tintAlpha: getVar("--glass-tint-alpha"),
			noise: getVar("--glass-noise"),
			shadow: getVar("--glass-shadow-strength"),
		};
	}

	function buildHtmlSnippet() {
		const title = escapeHtml(previewTitle.textContent || "Glass Card");
		return `<div class="glass-card">
	<div class="glass-card__header">
		<div>
			<div class="glass-title">${title}</div>
			<div class="glass-subtitle">Your text here</div>
		</div>
		<div class="glass-badge">glass</div>
	</div>
	<div class="glass-card__body">
		<p>Content goes here…</p>
	</div>
</div>`;
	}

	function buildCssSnippet() {
		const v = currentCssValues();
		return `.glass-card {
	--glass-bg-opacity: ${v.opacity};
	--glass-border-alpha: ${v.border};
	--glass-blur: ${v.blur};
	--glass-sat: ${v.sat};
	--glass-bright: ${v.bright};
	--glass-radius: ${v.radius};
	--glass-tint-hue: ${v.tintHue};
	--glass-tint-alpha: ${v.tintAlpha};
	--glass-noise: ${v.noise};
	--glass-shadow-strength: ${v.shadow};

	position: relative;
	overflow: hidden;
	border-radius: var(--glass-radius);
	border: 1px solid rgba(255, 255, 255, var(--glass-border-alpha));
	background:
		linear-gradient(
			135deg,
			rgba(255, 255, 255, calc(var(--glass-bg-opacity) + 0.06)),
			rgba(255, 255, 255, calc(var(--glass-bg-opacity) - 0.02))
		),
		hsla(var(--glass-tint-hue) 100% 55% / var(--glass-tint-alpha));
	box-shadow:
		0 18px 52px rgba(0, 0, 0, calc(0.42 * var(--glass-shadow-strength))),
		inset 0 1px 0 rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat)) brightness(var(--glass-bright));
	-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat)) brightness(var(--glass-bright));
	color: rgba(255, 255, 255, 0.92);
}

.glass-card::before {
	content: "";
	position: absolute;
	inset: 0;
	background: radial-gradient(900px 420px at 15% 12%, rgba(255, 255, 255, 0.22), transparent 55%);
	pointer-events: none;
}

.glass-card::after {
	content: "";
	position: absolute;
	inset: 0;
	opacity: var(--glass-noise);
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
	background-size: 180px 180px;
	mix-blend-mode: overlay;
	pointer-events: none;
}`;
	}

	function updateCodeBox() {
		const html = buildHtmlSnippet();
		const css = buildCssSnippet();
		codeBox.value = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}`;
	}

	function setStatus(text) {
		copyStatus.textContent = text;
		if (!text) return;
		window.clearTimeout(setStatus._t);
		setStatus._t = window.setTimeout(() => {
			copyStatus.textContent = "";
		}, 1800);
	}

	async function copyText(text) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			// Fallback for some browsers / file:// context
			codeBox.focus();
			codeBox.select();
			try {
				return document.execCommand("copy");
			} catch {
				return false;
			}
		}
	}

	function attachInputHandlers() {
		const map = [
			[inputs.blur, "--glass-blur", (v) => `${v}px`],
			[
				inputs.opacity,
				"--glass-bg-opacity",
				(v) => `${Number(v).toFixed(2)}`,
			],
			[inputs.sat, "--glass-sat", (v) => `${v}%`],
			[inputs.bright, "--glass-bright", (v) => `${v}%`],
			[
				inputs.border,
				"--glass-border-alpha",
				(v) => `${Number(v).toFixed(2)}`,
			],
			[inputs.radius, "--glass-radius", (v) => `${v}px`],
			[inputs.tintHue, "--glass-tint-hue", (v) => `${v}`],
			[
				inputs.tintAlpha,
				"--glass-tint-alpha",
				(v) => `${Number(v).toFixed(2)}`,
			],
			[inputs.noise, "--glass-noise", (v) => `${Number(v).toFixed(2)}`],
			[
				inputs.shadow,
				"--glass-shadow-strength",
				(v) => `${Number(v).toFixed(2)}`,
			],
		];

		map.forEach(([input, cssVar, format]) => {
			input.addEventListener("input", () => {
				setVar(cssVar, format(input.value));
				updateCodeBox();
			});
		});
	}

	function renderChips() {
		styleChips.innerHTML = "";
		Object.entries(PRESETS).forEach(([key, preset]) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "chip";
			btn.dataset.preset = key;
			btn.textContent = preset.label;
			btn.addEventListener("click", () => applyPreset(key));
			styleChips.appendChild(btn);
		});
	}

	function renderMiniGallery() {
		miniGallery.innerHTML = "";
		Object.entries(PRESETS).forEach(([key, preset]) => {
			const col = document.createElement("div");
			col.className = "col-12 col-md-6";

			const card = document.createElement("div");
			card.className = "glass-card mini";
			card.dataset.preset = key;
			card.tabIndex = 0;
			card.role = "button";
			card.setAttribute("aria-label", `Select ${preset.label}`);
			card.addEventListener("click", () => applyPreset(key));
			card.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					applyPreset(key);
				}
			});

			const header = document.createElement("div");
			header.className = "glass-card__header";
			header.innerHTML = `<div>
				<div class="glass-title">${escapeHtml(preset.label)}</div>
				<div class="glass-subtitle">${escapeHtml(preset.subtitle)}</div>
			</div>
			<div class="glass-badge">preset</div>`;

			card.appendChild(header);
			col.appendChild(card);
			miniGallery.appendChild(col);
		});

		// Apply per-card vars for each preset so the mini previews differ.
		$$("#miniGallery .glass-card").forEach((card) => {
			const preset = PRESETS[card.dataset.preset];
			Object.entries(preset.vars).forEach(([k, v]) => {
				card.style.setProperty(k, v);
			});
		});
	}

	function initSupportPill() {
		const ok = supportsBackdropFilter();
		if (!ok) document.body.classList.add("no-backdrop");
		previewBadge.textContent = ok ? "backdrop" : "fallback";
		supportPill.textContent = ok
			? "Backdrop blur: supported"
			: "Backdrop blur: not supported (fallback)";
	}

	function snapshotDefaultVars() {
		defaultVars = currentCssValues();
	}

	function resetToDefault() {
		if (!defaultVars) return;
		setVar("--glass-blur", defaultVars.blur);
		setVar("--glass-bg-opacity", defaultVars.opacity);
		setVar("--glass-sat", defaultVars.sat);
		setVar("--glass-bright", defaultVars.bright);
		setVar("--glass-border-alpha", defaultVars.border);
		setVar("--glass-radius", defaultVars.radius);
		setVar("--glass-tint-hue", defaultVars.tintHue);
		setVar("--glass-tint-alpha", defaultVars.tintAlpha);
		setVar("--glass-noise", defaultVars.noise);
		setVar("--glass-shadow-strength", defaultVars.shadow);
		syncInputsFromVars();
		updateCodeBox();
		setStatus("Reset done.");
	}

	function attachButtonHandlers() {
		buttons.copyAll.addEventListener("click", async () => {
			const ok = await copyText(codeBox.value);
			setStatus(ok ? "Copied: All" : "Copy failed");
		});

		buttons.copyHTML.addEventListener("click", async () => {
			const ok = await copyText(buildHtmlSnippet());
			setStatus(ok ? "Copied: HTML" : "Copy failed");
		});

		buttons.copyCSS.addEventListener("click", async () => {
			const ok = await copyText(buildCssSnippet());
			setStatus(ok ? "Copied: CSS" : "Copy failed");
		});

		buttons.reset.addEventListener("click", () => {
			applyPreset(activePresetKey);
			setStatus("Preset reset.");
		});
	}

	function init() {
		initSupportPill();
		renderChips();
		renderMiniGallery();
		applyPreset(activePresetKey);
		snapshotDefaultVars();
		attachInputHandlers();
		attachButtonHandlers();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
