import { createElement } from 'lwc';
import AccountSearch from 'c/accountSearch';
import findAccounts from '@salesforce/apex/AccountController.findAccounts';

// 命令型Apexのメソッドコールをモック化
jest.mock(
    '@salesforce/apex/AccountController.findAccounts',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true}
);

// 命令型Apex呼び出しのサンプルデータ
const APEX_ACCOUNT_SUCCESS = [
    {
        Id: '1234512345ABCDEFGH',
        Name: 'Dics',
        Type: 'Customer - Channel',
        Industry: 'Consulting'
    }
];

// 命令型Apex呼び出しのサンプルエラーデータ
const APEX_ACCOUNT_ERROR = {
        body: { message: 'An internal sever error has occurred'},
        ok: false,
        status: 400,
        statusText: 'Bad Request'
    };

describe('c-account-search', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        // モックに保存されたデータがテスト間で漏れないようにする。
        jest.clearAllMocks();
    });

    // マイクロタスクキューが空になるまで待機するヘルパー関数。
    // 命令型Apexを呼び出す際のプロミスのタイミングに必要。
    async function flushPromises(){
        return Promise.resolve();
    }

    // ユーザー入力をApexのメソッドに正しく渡す。
    it('passes the user input to the Apex method correctly', async () => {
        
        const USER_INPUT = 'NDics';
        const APEX_PARAMETERS = { searchName: USER_INPUT,  searchType: "", searchIndustry: ""};
       
        // 解決されたApexプロミスにモック値を割り当てる。Promise.resolve(value)
        findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS);

        // 最初の要素の作成
        const element = createElement('c-apex-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        // ユーザー入力をシミュレーションするための入力項目を選択。
        const inputEl = element.shadowRoot.querySelector('lightning-input.accountName');
        inputEl.value = USER_INPUT;
        inputEl.dispatchEvent(new CustomEvent('change'));

        // Apex呼び出しを実行するボタンを選択。
        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        // 非同期のDOM更新を待つ。
        await flushPromises();

        // モックされたApex呼び出しのパラメータを検証
        expect(findAccounts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
    });


    it('renders one account',  async () => {
        const USER_INPUT = 'NDics';

        findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS);

        const element = createElement('c-apex-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        const inputEl = element.shadowRoot.querySelector('lightning-input.accountName');
        inputEl.value = USER_INPUT;
        inputEl.dispatchEvent(new CustomEvent('change'));

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        // 条件付きで変更されたコンテンツを検証するためのlightning-tileを選択。
        const detailEls = element.shadowRoot.querySelectorAll('lightning-tile');
        expect(detailEls.length).toBe(APEX_ACCOUNT_SUCCESS.length);
        expect(detailEls[0].label).toBe(APEX_ACCOUNT_SUCCESS[0].Name);
    });

    // Apexのメソッドがエラーを返したときにエラーパネルをレンダリング。
    it('renders the error panel when the Apex method returns an error', async () => {

        // 拒否されたApexプロミスに対するモック値を割り当てる。
        findAccounts.mockRejectedValue(APEX_ACCOUNT_ERROR);

        const element = createElement('c-apex-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        const errorPanelEl = element.shadowRoot.querySelector('c-error-panel');
        expect(errorPanelEl).not.toBeNull();
    });


 // toBeAccessible() is not function エラー
    // データが返されたときにアクセス可能
    // it('is accessible when data is returned', async () => {

    //     findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS);
        
    //     const element = createElement('c-apex-account-search', {
    //         is: AccountSearch
    //     });
    //     document.body.appendChild(element);

    //     const buttonEl = element.shadowRoot.querySelector('lightning-button');
    //     buttonEl.click();

    //     await flushPromises();

    //     await expect(element).toBeAccessible();
    // });

    // // エラーが返されたときにアクセス可能
    // it('is accessible when error is  returned', async () => {
         
    //     findAccounts.mockRejectedValue(APEX_ACCOUNT_ERROR);

    //     const element = createElement('c-apex-account-search', {
    //         is: AccountSearch
    //     });
    //     document.body.appendChild(element);

    //     const buttonEl = element.shadowRoot.querySelector('lightning-button');
    //     buttonEl.click();

    //     await flushPromises();

    //     await expect(element).toBeAccessible();
    // });


});