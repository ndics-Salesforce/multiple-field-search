import { createElement } from 'lwc';
import AccountSearch from 'c/accountSearch';
import { getNavigateCalledWith } from 'lightning/navigation';
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
        Name: 'NDics',
        Type: 'Customer - Channel',
        Industry: 'Consulting'
    },
    {
        Id: '01234512345ABCDEFG',
        Name: 'Nihon',
        Type: 'Customer - Direct',
        Industry: 'Electoronics'
    }
];

const APEX_ACCOUNT_SUCCESS_2 = [
    {
        Id: '1234512345ABCDEFGH',
        Name: 'NDics',
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
        
        const USER_INPUT_NAME = 'Dics';
        const USER_INPUT_TYPE = 'Customer';
        const USER_INPUT_INDUSTRY = 'Electronics';
        const APEX_PARAMETERS = { searchName: USER_INPUT_NAME,  searchType: USER_INPUT_TYPE, searchIndustry: USER_INPUT_INDUSTRY};
       
        // 解決されたApexプロミスにモック値を割り当てる。Promise.resolve(value)
        findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS);

        // 最初の要素の作成
        const element = createElement('c-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        // ユーザー入力をシミュレーションするための入力項目を選択。
        const inputEl_name = element.shadowRoot.querySelector('lightning-input.name');
        const inputEl_type = element.shadowRoot.querySelector('lightning-input.type');
        const inputEl_industry = element.shadowRoot.querySelector('lightning-input.industry');
    
        inputEl_name.value = USER_INPUT_NAME;
        inputEl_type.value = USER_INPUT_TYPE;
        inputEl_industry.value = USER_INPUT_INDUSTRY;
        
        // inputElの値をchangeイベントで変更
        inputEl_name.dispatchEvent(new CustomEvent('change'));
        inputEl_type.dispatchEvent(new CustomEvent('change'));
        inputEl_industry.dispatchEvent(new CustomEvent('change'));

        // Apex呼び出しを実行するボタンを選択、クリックで実行。
        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        // 非同期のDOM更新を待つ。
        await flushPromises();

        // モックされたApex呼び出しのパラメータを検証
        expect(findAccounts.mock.calls[0][0]).toEqual(APEX_PARAMETERS);
        console.log(findAccounts.mock.calls[0][0]);
    });

    it('renders two account',  async () => {
        const USER_INPUT_NAME = 'Dics'; // 1つ目の取引先のみ一致
        const USER_INPUT_TYPE = 'Customer - Direct'; // 2つ目の取引先のみ一致
        const USER_INPUT_INDUSTRY = 'Construction'; // 不一致

        findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS);

        const element = createElement('caccount-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        const inputEl_name = element.shadowRoot.querySelector('lightning-input.name');
        const inputEl_type = element.shadowRoot.querySelector('lightning-input.type');
        const inputEl_industry = element.shadowRoot.querySelector('lightning-input.industry');
    
        inputEl_name.value = USER_INPUT_NAME;
        inputEl_type.value = USER_INPUT_TYPE;
        inputEl_industry.value = USER_INPUT_INDUSTRY;

        inputEl_name.dispatchEvent(new CustomEvent('change'));
        inputEl_type.dispatchEvent(new CustomEvent('change'));
        inputEl_industry.dispatchEvent(new CustomEvent('change'));

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        // 条件付きで変更されたコンテンツを検証するためのlightning-tileを選択。
        const detailEls = element.shadowRoot.querySelectorAll('lightning-tile');

        expect(detailEls.length).toBe(APEX_ACCOUNT_SUCCESS.length);
        expect(detailEls[0].label).toBe(APEX_ACCOUNT_SUCCESS[0].Name);
        expect(detailEls[1].label).toBe(APEX_ACCOUNT_SUCCESS[1].Name);
        console.log(detailEls.length,detailEls[0].label,detailEls[1].label);
    });

    // 名前のみの検索
    it('renders one account',  async () => {
        const USER_INPUT_NAME = 'Dics'; // 1つ目の取引先のみ一致
        const USER_INPUT_TYPE = null; // 空欄
        const USER_INPUT_INDUSTRY = null; // 空欄

        findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS_2);

        const element = createElement('c-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        const inputEl_name = element.shadowRoot.querySelector('lightning-input.name');
        const inputEl_type = element.shadowRoot.querySelector('lightning-input.type');
        const inputEl_industry = element.shadowRoot.querySelector('lightning-input.industry');
    
        inputEl_name.value = USER_INPUT_NAME;
        inputEl_type.value = USER_INPUT_TYPE;
        inputEl_industry.value = USER_INPUT_INDUSTRY;

        inputEl_name.dispatchEvent(new CustomEvent('change'));
        inputEl_type.dispatchEvent(new CustomEvent('change'));
        inputEl_industry.dispatchEvent(new CustomEvent('change'));

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        // 条件付きで変更されたコンテンツを検証するためのlightning-tileを選択。
        const detailEls = element.shadowRoot.querySelectorAll('lightning-tile');

        expect(detailEls.length).toBe(APEX_ACCOUNT_SUCCESS_2.length);
        expect(detailEls[0].label).toBe(APEX_ACCOUNT_SUCCESS_2[0].Name);
        expect(detailEls[1]).toBeUndefined();
        console.log(detailEls.length,detailEls[0].label);
        console.log(findAccounts.mock.results[0].value);
    });

    // Apexのメソッドがエラーを返したときにエラーパネルを生成。
    it('renders the error panel when the Apex method returns an error', async () => {

        // 拒否されたApexプロミスに対するモック値を割り当てる。
        findAccounts.mockRejectedValue(APEX_ACCOUNT_ERROR);

        const element = createElement('c-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        const errorPanelEl = element.shadowRoot.querySelector('c-error-panel');
        expect(errorPanelEl).not.toBeNull();
    });


    //getNavigateCalledWith()エラー時の参考サイト→https://www.swdcworld.com/2020/01/jest-test-class-for-navigatemixin.html
    // レコードページへの遷移
    it('navigates to record page', async () => {
        const USER_INPUT_NAME = 'Dics'; // 1つ目の取引先のみ一致
        const USER_INPUT_TYPE = null; // 空欄
        const USER_INPUT_INDUSTRY = null; // 空欄
        const NAV_TYPE = 'standard__recordPage';
        const NAV_OBJECT_API_NAME = 'Account';
        const NAV_ACTION_NAME = 'view';
        const NAV_RECORD_ID = '1234512345ABCDEFGH';

        findAccounts.mockResolvedValue(APEX_ACCOUNT_SUCCESS_2);

        const element = createElement('c-account-search', {
            is: AccountSearch
        });
        document.body.appendChild(element);

        const inputEl_name = element.shadowRoot.querySelector('lightning-input.name');
        const inputEl_type = element.shadowRoot.querySelector('lightning-input.type');
        const inputEl_industry = element.shadowRoot.querySelector('lightning-input.industry');
    
        inputEl_name.value = USER_INPUT_NAME;
        inputEl_type.value = USER_INPUT_TYPE;
        inputEl_industry.value = USER_INPUT_INDUSTRY;

        inputEl_name.dispatchEvent(new CustomEvent('change'));
        inputEl_type.dispatchEvent(new CustomEvent('change'));
        inputEl_industry.dispatchEvent(new CustomEvent('change'));

        const buttonEl = element.shadowRoot.querySelector('lightning-button');
        buttonEl.click();

        await flushPromises();

        const buttonEl_page = element.shadowRoot.querySelector('lightning-button-icon');
        buttonEl_page.click();

        const { pageReference } = getNavigateCalledWith();

        expect(pageReference.type).toBe(NAV_TYPE);
        expect(pageReference.attributes.objectApiName).toBe(NAV_OBJECT_API_NAME);
        expect(pageReference.attributes.actionName).toBe(NAV_ACTION_NAME);
        expect(pageReference.attributes.recordId).toBe(NAV_RECORD_ID);
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