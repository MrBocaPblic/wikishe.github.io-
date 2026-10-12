## Para a "equipe"

```
  box-shadow: 1px 2px 3px rgb(18, 5, 34);
```
>Box-Shadow : Faz uma sombra no formato do elemento;
>>Argumento1:Deslocamento horizontal;
>>
>>Argumento2:Deslocamento vertical;
>>
>>Argumento3:Desfoque da sombra;
>>
>>Argumento4:Cor da sombra;
>>
>.
>
``` 
    background: linear-gradient(90deg, hsl(261, 56%, 25%) 40%,hsla(267, 96%, 60%, 0.212) 100%);
```
>Background: Fundo, literalmente
>
>linear-gradient: Gradiente linear 0%..100%
>
>>linear-gradient(a, b...) 
>>
>>Sobre os argumentos, o primeiro pode já ser a cor de tantos porcentos
>>(do menor ao maior), como também pode ser a rotação/direção em graus do gradient
>>
> radial-gradient: O mesmo do linear, mas é como um circulo e não tem a rotação; É do centro para fora;

```
    word-wrap: break-word;      /* Quebra palavras longas para caber na largura */
    overflow-wrap: break-word;  /* Versão moderna do word-wrap */
    word-break: break-word;
```
```
talpropriedade: var(--propriedade);
//Se usa para classes/ids com propriedades customizadas
(Sem precisar criar varias classes para a mesma ideia)

<li class="font-siz font-weig" style="--tamanho:15px ; --Fpeso: 400">...</li>                         

//font-size e font-weig são 2 classes que usam (var)
//A variavel customizada para o elemento esta em style=""
//Nesse caso: 
//--tamanho: 15;
//--Fpeso: 400;
//-->
.font-weig{
     font-weight: var(--Fpeso);
}
.font-siz{
     font-size: var(--tamanho);
}

//Alias:
background: transparent !important
//Esse "!important" faz com que essa propriedade seja priorizada;
//Não importa quantas vezes tentar redefinir, não será redefinido;

```
