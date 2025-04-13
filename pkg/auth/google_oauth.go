package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	_ "github.com/IlfGauhnith/GraoAGrao/pkg/config"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var oauthConfig *oauth2.Config

func init() {
	oauthConfig = &oauth2.Config{
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}

// GetAuthURL generates the URL for Google's OAuth consent page using the provided state.
func GetAuthURL(state string) string {
	return oauthConfig.AuthCodeURL(state)
}

// ExchangeCode exchanges the provided code for an access token.
func ExchangeCode(code string) (*oauth2.Token, error) {
	token, err := oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %v", err)
	}
	return token, nil
}

// GetUserInfo uses the access token to retrieve user info from Google.
func GetUserInfo(token *oauth2.Token) (map[string]interface{}, error) {
	client := oauthConfig.Client(context.Background(), token)
	response, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	data, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	var userInfo map[string]interface{}
	if err := json.Unmarshal(data, &userInfo); err != nil {
		return nil, err
	}
	return userInfo, nil
}
