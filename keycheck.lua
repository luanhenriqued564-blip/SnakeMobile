-- ============================================================
--  KEY SYSTEM — Script do Executor
--  Compatível com: Fluxus, Delta, Arceus X, Codex, etc.
-- ============================================================

local Players     = game:GetService("Players")
local StarterGui  = game:GetService("StarterGui")
local HttpService = game:GetService("HttpService")

local player = Players.LocalPlayer
local userId = tostring(player.UserId)

-- URL do seu site Vercel (altere aqui)
local BASE_URL = "https://seu-projeto.vercel.app"
local siteURL  = BASE_URL .. "/?id=" .. userId

-- ── NOTIFICAÇÃO HELPER ──────────────────────────────────────
local function notify(titulo, texto, duracao)
    pcall(function()
        StarterGui:SetCore("SendNotification", {
            Title    = titulo,
            Text     = texto,
            Duration = duracao or 5,
        })
    end)
end

-- ── ABRIR SITE (copia link + notifica) ─────────────────────
local function abrirSite()
    pcall(function() setclipboard(siteURL) end)

    notify(
        "🔐 KEY SYSTEM",
        "Link copiado! Abra no navegador, resolva os puzzles e cole a KEY aqui.",
        7
    )

    print("╔══════════════════════════════════════╗")
    print("║          🔐 KEY SYSTEM v2.0          ║")
    print("╠══════════════════════════════════════╣")
    print("║ User ID : " .. userId)
    print("║ Link    : " .. siteURL)
    print("╚══════════════════════════════════════╝")
    print("→ Cole a KEY abaixo quando tiver ela.")
end

-- ── VALIDAÇÃO LOCAL DA KEY ──────────────────────────────────
local function validarKey(key)
    if type(key) ~= "string" or #key < 5 then return false end

    local hoje = os.date("*t")
    local dia  = tostring(hoje.day)
    local mes  = tostring(hoje.month)

    -- Verifica se a KEY começa com DD_MM_
    local prefixo = dia .. "_" .. mes .. "_"
    if not key:sub(1, #prefixo) == prefixo then return false end

    -- Recalcula o valor esperado localmente para dupla verificação
    local numId   = tonumber(userId)
    if not numId then return false end

    local resultado   = (numId * 80) + (40 / 3)
    local resultFmt   = string.format("%.2f", resultado):gsub("%.", "_")
    local keyEsperada = dia .. "_" .. mes .. "_" .. resultFmt

    return key == keyEsperada
end

-- ── LOOP DE VALIDAÇÃO ───────────────────────────────────────
local function pedirKey()
    -- Pede a KEY via syn.protect_gui ou equivalente
    -- Em executores sem UI nativa, usa o readfile se quiser salvar
    local key = nil
    local tentativas = 0
    local MAX_TENTATIVAS = 5

    while not key and tentativas < MAX_TENTATIVAS do
        tentativas = tentativas + 1

        -- Usa inputbox se disponível, senão pede pelo console
        local ok, input = pcall(function()
            -- Alguns executores têm essa função
            if syn and syn.request then
                -- executor syn-style: usa prompt nativo se disponível
            end
            -- Fallback: lê de um arquivo (o usuário cola a KEY num .txt)
            if readfile then
                local conteudo = pcall(readfile, "key.txt") and readfile("key.txt") or nil
                if conteudo and #conteudo > 3 then
                    return conteudo:gsub("%s+", "") -- remove espaços/newlines
                end
            end
            return nil
        end)

        if ok and input and #input > 3 then
            key = input
        else
            print("⏳ [Tentativa " .. tentativas .. "/" .. MAX_TENTATIVAS .. "] Cole a KEY no arquivo 'key.txt' ou aguarde...")
            task.wait(5)
        end
    end

    return key
end

-- ── MAIN ────────────────────────────────────────────────────
local function main()
    abrirSite()

    print("\n📋 Aguardando KEY...")
    print("   Dica: Cole a KEY no arquivo 'key.txt' na pasta do executor.\n")

    -- Aguarda um pouco pro usuário abrir o site
    task.wait(3)

    -- Loop de verificação de key.txt
    local keyValida  = false
    local tentativas = 0
    local MAX        = 30  -- tenta por até ~2.5 min

    while not keyValida and tentativas < MAX do
        tentativas = tentativas + 1
        task.wait(5)

        local ok, conteudo = pcall(readfile, "key.txt")
        if ok and conteudo then
            local key = conteudo:gsub("%s+", "")
            if #key > 5 then
                if validarKey(key) then
                    keyValida = true
                    notify("✅ KEY Aceita!", "Carregando script principal...", 4)
                    print("✅ KEY válida! Executando script principal...")
                    print("   KEY: " .. key)

                    -- Limpa o arquivo de key para segurança
                    pcall(writefile, "key.txt", "")

                    -- ══════════════════════════════════════
                    -- CARREGUE SEU SCRIPT PRINCIPAL AQUI:
                    -- ══════════════════════════════════════
                    -- loadstring(game:HttpGet("https://seu-script.com/main.lua"))()

                else
                    notify("❌ KEY Inválida", "Gere uma nova KEY no site.", 5)
                    print("❌ KEY inválida ou expirada: " .. key)
                    print("   Gere uma nova no site: " .. siteURL)
                    pcall(writefile, "key.txt", "") -- limpa
                    tentativas = MAX                -- para o loop
                end
            end
        end

        if tentativas % 6 == 0 and not keyValida then
            print("⏳ Ainda aguardando KEY... (" .. math.floor(tentativas * 5 / 60) .. " min)")
        end
    end

    if not keyValida then
        print("⏰ Tempo esgotado. Execute o script novamente.")
        notify("⏰ Timeout", "Execute o script novamente e complete o site.", 6)
    end
end

-- Executa com proteção de erro
local ok, err = pcall(main)
if not ok then
    warn("[KEY-SYSTEM] Erro: " .. tostring(err))
    print("⚠️ Erro no Key System: " .. tostring(err))
end
