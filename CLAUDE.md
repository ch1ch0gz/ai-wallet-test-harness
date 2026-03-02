# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This is a research project for analyzing AI wallet competitors. The goal is to gather, analyze, and synthesize competitive intelligence on AI-powered crypto/web3 wallet products.

## Available MCP Tools

Three MCP servers are enabled for this project:

### `research-tools`
- `analyze_repo_metrics` — GitHub repo health (stars, forks, contributors, commit velocity, issue resolution)
- `analyze_sentiment` — Sentiment analysis of GitHub issues for a given repo
- `analyze_social_trends` — Social media trend analysis across Twitter, Reddit, and Hacker News; distinguishes organic interest from VC/marketing hype

### `gemini-deep-research`
- `deep_research` — Multi-source synthesis agent for complex research questions. Takes 5–20 minutes and costs ~$2–5 per call. Use sparingly for deep dives, not quick lookups.

### `claude_ai_Excalidraw`
- `create_view` — Render hand-drawn diagrams (call `read_me` first for element format)
- `export_to_excalidraw` — Upload diagram to excalidraw.com for a shareable URL

## Research Workflow

- Use `analyze_repo_metrics` and `analyze_sentiment` for quick competitor GitHub assessment
- Use `analyze_social_trends` to gauge community interest vs. marketing hype
- Reserve `deep_research` for synthesis tasks requiring multiple sources
- Use Excalidraw to visualize competitive landscapes, feature matrices, or architecture comparisons

## Self-Correction Protocol

After any correction by the user, end your response with:
> "Update your CLAUDE.md so you don't make that mistake again."

Then immediately propose the specific rule addition.
